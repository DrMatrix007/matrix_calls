use futures_util::StreamExt;
use tokio::io::{AsyncRead, AsyncWrite};
use tokio_tungstenite::{tungstenite::Message, WebSocketStream};
pub async fn handle<T: AsyncRead + AsyncWrite + Unpin>(client: T) -> Result<(), String> {
    let mut client = tokio_tungstenite::accept_async(client)
        .await
        .map_err(|_| "Connection Error".to_string())?;
    loop {
        let message = get_req(&mut client).await;

        println!("res from c: {:?}", message);
    }
    // Ok(())
}

#[derive(Debug, Clone, Copy)]
pub enum RequestError {
    ConnectionEnd,
    BadRequest,
}

pub async fn get_req<T: AsyncRead + AsyncWrite + Unpin>(
    client: &mut WebSocketStream<T>,
) -> Result<serde_json::Value, RequestError> {
    let message = client.next().await;

    let message = match message {
        None => return Err(RequestError::ConnectionEnd),
        Some(message) => message,
    };

    let message = match message {
        Ok(message) => message,
        Err(error) => {
            return Err(match error {
                tokio_tungstenite::tungstenite::Error::ConnectionClosed
                | tokio_tungstenite::tungstenite::Error::AlreadyClosed => {
                    RequestError::ConnectionEnd
                }
                _ => RequestError::BadRequest,
            })
        }
    };

    let message = match message {
        Message::Text(message) => message,
        _ => return Err(RequestError::BadRequest),
    };

    let message = match serde_json::from_str::<serde_json::Value>(message.as_str()) {
        Ok(message) => message,
        _ => return Err(RequestError::BadRequest),
    };
    Ok(message)
}
