use tokio::net::TcpListener;

use crate::client_handle;

pub struct Server {
    sock: tokio::net::TcpListener,
}

impl Server {
    pub async fn new() -> Self {
        let sock = TcpListener::bind("127.0.0.1:6969").await.unwrap();
        Self { sock }
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

            tokio::task::spawn(async {
                println!("res is :{:?}", client_handle::handle(client).await);
            });
        }
    }
}
