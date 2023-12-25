use std::sync::Arc;

use server::Server;
use tokio::runtime::{Builder, Runtime};

pub mod client_handle;
pub mod server;

fn main() {
    let rt = Arc::new(
        Builder::new_multi_thread()
            .worker_threads(20)
            .enable_io()
            .build()
            .unwrap(),
    );
    let cloned_rt = rt.clone();
    rt.block_on(run_server(cloned_rt));
}

async fn run_server(rt: Arc<Runtime>) {
    let server = Server::new(rt).await;
    server.run().await;
}
