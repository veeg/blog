use testcontainers::clients::Cli;
use testcontainers::images::generic::GenericImage;
use testcontainers::Docker;

#[test]
fn hello_world() {
    let test = Cli::default();

    let image = GenericImage::new("hello-world");

    let _container = test.run(image);

    // Test body is now running
}
