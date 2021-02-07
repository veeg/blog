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
