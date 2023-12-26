use server::Server;

pub mod client_handle;
pub mod server;

#[tokio::main(flavor = "multi_thread", worker_threads = 10)]
async fn main() {
    run_server().await;
}

async fn run_server() {
    let server = Server::new().await;
    server.run().await;
}
