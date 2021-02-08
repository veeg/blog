+++
title = "An introduction to containerized integration tests - dockertest-rs"
date = 2021-01-25

[taxonomies]
tags = ["dockertest", "rust"]
+++

This is an introductory post to [dockertest-rs](https://crates.io/crates/dockertest), a mechanism to control your dependencies in containers from an integration test environment, with Rust.

<!-- more -->

This project was born out of rather great frustration for the integration tests we were developing 
for our API server. Nothing would be more apt than to have the full stack tested in some scenarios,
but attempting to wrestle with the host environment both on your CI, as well as the local developers
machine, soon turned foul.

## Prior art

Therefore, we started looking around for a solution to containerize
this dependency, and control it solely from the test itself. After some various <insert-search-engine-of-choice-here> later, we dived particularly into these two:

* [ory/dockertest](https://github.com/ory/dockertest): written in go. Seems rather popular and the only thing I could dig up around the search term `dockertest`.
* [testcontainers](https://crates.io/crates/testcontainers): a Rust fork of the Java library from [testcontainers.org](www.testcontainers.org).

Initially, the API surface and grouping of operations seemed rather clunky from both options.
There is no clearly defining scope for the body of the test.

The ory alternative was never really an alternative, since it was not a Rust library and I for one would rather like to control everything from within the sheltered walls of Cargo.
Therefore, I did investigate thoroughly how I could utilize testcontainers instead.

To my dismay, I felt that there was a rather unpolished API surface and a bit too
much boilerplate for my taste. The process of defining an
[Image](https://docs.rs/testcontainers/0.11.0/testcontainers/trait.Image.html) to utilize,
and turning it into an Container, was nothing but confusing to me. It requires implementing
the trait with a whole lot of associates types and required methods. It also muddies the waters
between the fact that an image itself should not concern itself with the conditions for its container.
One may envision using the same image with different arguments, different volumes, different environemnt variables. It just adds up in boilerplate. It does however provide a convenient
wrapper to specify simple image from the docker repository name, through [GenericImage](https://docs.rs/testcontainers/0.12.0/testcontainers/images/generic/struct.GenericImage.html).

Below is the hello-world test case using testcontainers, with the GenericImage abstraction.

```rust
use testcontainers::clients::Cli;
use testcontainers::images::generic::GenericImage;
use testcontainers::Docker;

#[test]
fn hello_world() {
    let test = Cli::default();

    let image = GenericImage::new("hello-world");

    let container = test.run(image);

    // Test body is now running
}
```

An observation from this API design is that it does not allow for multiple containers in the
same test environment. The [Docker](https://docs.rs/testcontainers/0.12.0/testcontainers/trait.Docker.html) trait, fulfilled by [Cli](https://docs.rs/testcontainers/0.12.0/testcontainers/clients/struct.Cli.html)
client used above, is structured to interact and control a single container. It does not aid
with an environment where multiple containers may be present and have dependencies between them.
If this is to be achieved, it is solely up to the user.

But one point of inspiration was the mechanism around
[wait_for_ready](https://docs.rs/testcontainers/0.11.0/testcontainers/trait.Image.html#tymethod.wait_until_ready) method.
It advertises itself as the 🍞 and butter of the whole testcontainer library, and I rather agree!
It is an excellent idea for controlling separating the execution of the container from that of your
test body.

## dockertest-rs

The observations above paved way for the architecture of `dockertest-rs`.

* A [DockerTest](https://docs.rs/dockertest/0.1.2/dockertest/struct.DockerTest.html)
instance to control the execution of the test and its test body through
the closures required for
[run](https://docs.rs/dockertest/0.1.2/dockertest/struct.DockerTest.html#method.run) and the async version [run_async](https://docs.rs/dockertest/0.1.2/dockertest/struct.DockerTest.html#method.run_async).
This creates the nice separation of the setup of the test with that of its test body.

```rust
use dockertest::{Composition, DockerTest};

#[test]
fn hello_world() {
    let mut test = DockerTest::new();

    let hello = Composition::with_repository("hello-world");

    test.add_composition(hello);

    test.run(move |_ops| async {
        // Test body running here
    });
}
```

* The intermediate step between an Image and the Container is represented by a
[Composition](https://docs.rs/dockertest/0.1.2/dockertest/struct.Composition.html).
It establishes the missing mental model to parameterize an image. It also assist with
the order of how the container is started, and the conditions of readiness.

* It generalizes the readiness mechanism from testcontainers through a [WaitFor](https://docs.rs/dockertest/0.2.0/dockertest/waitfor/trait.WaitFor.htm://docs.rs/dockertest/0.2.0/dockertest/waitfor/trat.WaitFor.html) trait
and [batteries included](https://docs.rs/dockertest/0.2.0/dockertest/waitfor/index.html) implementations.

The full powerfulness of these rather simple building blocks can be seen in one of the integration tests, where two communicating containers depend on each other, and where we expect some output
from the containers in question.

```rust
use dockertest::waitfor::{MessageSource, MessageWait};
use dockertest::{Composition, DockerTest, StartPolicy};

#[test]
fn test_inject_container_name_ip_through_env_communication() {
    let mut test = DockerTest::new();

    let recv = Composition::with_repository("dockertest-rs/coop_recv")
        .with_start_policy(StartPolicy::Strict)
        .with_wait_for(Box::new(MessageWait {
            message: "recv started".to_string(),
            source: MessageSource::Stdout,
            timeout: 10,
        }))
        .with_container_name("recv");
    test.add_composition(recv);

    let mut send = Composition::with_repository("dockertest-rs/coop_send")
        .with_start_policy(StartPolicy::Strict)
        .with_wait_for(Box::new(MessageWait {
            message: "send success".to_string(),
            source: MessageSource::Stdout,
            timeout: 60,
        }));
    send.inject_container_name("recv", "SEND_TO_IP");
    test.add_composition(send);

    test.run(|ops| async move {
        let recv = ops.handle("recv");
        recv.assert_message("coop send message to container", MessageSource::Stdout, 5)
            .await;
    });
}
```

Here we can see that the __coop_recv__ image is started with a strict policy, such that
we know that this container has completed its wait for directive prior to the __coop_send__ container is even created. Therefore, we do not have any race conditions for dependant operations
between them.

We can also observe that the __coop_send__ composition is injected with an environment variable
that contains the container name of __coop_recv__, such that it can communicate with it.
This is done by using the `container_name` (referred to as a handle) of the composition.
The container name can be set manually for each composition, but defaults to the repository name.
This allows the test writer to consistently interact with the containers that is part of the test.

## Future work

**dockertest-rs** is still in an active development mode. There are multiple areas of improvement
that has not gotten any attention. Some areas are:

* Proper Windows & Mac support. We have no active testing for these platforms, and the docker
networks interfaces does not work similarly across platforms. Therefore, not all functionality
will perform correctly on non-linux platforms.

* Private docker registries. We have abstracted the [Source](https://docs.rs/dockertest/0.2.0/dockertest/enum.Source.html) of an image, but the [Remote](https://docs.rs/dockertest/0.2.0/dockertest/struct.Remote.html) variant is not implemented.

* Figuring out the best methods of providing container-container and host-container communication,
related to both network and volume support, for both when dockertest itself runs on host or in a docker-in-docker container itself. We have preliminary support through an environment variable
`DOCKERTEST_CONTAINER_ID_INJECT_TO_NETWORK=your_container_id/name` set on the dockertest executable.
But this is an area where all use-cases must be documented, mapped, and reasoned about to
find the ideal interfaces to support all these cases.

## Conclusion

As of now, I see **dockertest-rs** as an exciting tool for various integration tests, highly suitable
for full-fledged API server tests with auxiliary dependencies such as a database.
It is definitely at a useable stage where I hope more projects can get mileage out of this project,
and hopefully it can organically evolve. There are many opportunities to contribute and shape
the direction of this project, supporting even more use-cases out of the box.
In truth, it would be cool to investigate routes
of deployments in other environments as well. We might need a name-change for that tho :)

For now, I hope this is a useful project for more than just me!

