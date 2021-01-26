+++
title = "An introduction to containerized integration tests - dockertest-rs"
date = 2021-01-25

[taxonomies]
tags = ["dockertest", "rust"]
+++

This is an introductory post to [dockertest-rs](https://crates.io/crates/dockertest), a mechanism to control your dependencies from containers in an integration test environment, from Rust.

<!-- more -->

This project was born out of rather great frustration for the integration tests we where developing 
for our API server. Nothing would be more apt than to have the full stack tested in some scenarios,
but attempting to wrestle with the host environment both on your CI, as well as the local developers
machine, soon turned foul.

## Prior work

Therefore, we started looking around for a solution to containerize
this dependency, and control it solely from the test itself. After some various <insert-search-engine-of-choice-here> later, we dived particulary into these two:

* [ory/dockertest](https://github.com/ory/dockertest): written in go. Seems rather popular and the only thing I could dig up around the search term `dockertest`.
* [testcontainers](https://crates.io/crates/testcontainers): a Rust fork of the Java library from [testcontainers.org](www.testcontainers.org).

Initially, the API surface and grouping of operations seemed rather clunky from both options.
There is no clearly defining scope for the body of the test.

The ory alternative was never really an alternative, since it was not a Rust library and I for one would rather like to control everything from within the sheltered walls of Cargo.
Therefore, I did investigate thoroughly how I could utilize testcontainers instead.

To my dismay, I felt that there was rather much unpolished API surfaces and a bit too
much boilerplate for my taste. The process of defining an
[Image](https://docs.rs/testcontainers/0.11.0/testcontainers/trait.Image.html) to utilize,
and turning it into an Container, was nothing but confusing to me. It requires implementing
the trait with a whole lot of associates types and required methods. It also muddies the waters
between the fact that an image itself should not concern itself with the conditions for its container.
One may envision using the same image with different arguments, different volumes, different environemnt variables. It just adds up in boilerplate.

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
let test = DockerTest::new();
test.run(|_| move {
    // Test body
});
```
* The intermediate step between an Image and the Container is represented by a
[Composition](https://docs.rs/dockertest/0.1.2/dockertest/struct.Composition.html).
It establishes the missing mental model of parameterizing an image. It also assist with
the order of how the container is started, and the conditions of readiness.

* TODO: Waitfor
