use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct SendMessageRequest {
    message: String,
}
