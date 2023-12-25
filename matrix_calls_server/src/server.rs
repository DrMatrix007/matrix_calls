use std::sync::Arc;

use tokio::{net::TcpListener, runtime::Runtime};

use crate::client_handle;

pub struct Server {
    sock: tokio::net::TcpListener,
    runtime: Arc<Runtime>,
}

impl Server {
    pub async fn new(rt: Arc<Runtime>) -> Self {
        let sock = TcpListener::bind("127.0.0.1:6969").await.unwrap();
        Self { sock, runtime: rt }
    }

    pub async fn run(self) -> ! {
        println!("starting server!");
        loop {
            let (client, _addr) = match self.sock.accept().await {
                Ok(client) => client,
                Err(_) => {
                    println!("cant connect!");
                    continue;
                }
            };

            self.runtime.spawn(async {
                println!("res is :{:?}", client_handle::handle(client).await);
            });
        }
    }
}
