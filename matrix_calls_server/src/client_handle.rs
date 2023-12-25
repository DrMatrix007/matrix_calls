use futures_util::StreamExt;
use tokio::{
    io::{AsyncRead, AsyncReadExt, AsyncWrite},
    net::{TcpListener, TcpStream},
};
pub async fn handle<T: AsyncRead + AsyncWrite + Unpin>(client: T) -> Result<(), String> {
    let mut client = tokio_tungstenite::accept_async(client)
        .await
        .map_err(|_| "Connection Error".to_string())?;

    let message = client.next().await;

    println!("{:?}", message);

    Ok(())
}
