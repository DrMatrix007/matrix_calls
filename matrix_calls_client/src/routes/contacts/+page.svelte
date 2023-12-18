<script lang="ts">
  let contacts = [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Doe", email: "jane@example.com" },
    // Add more contacts as needed
  ];
</script>

<div class="container">
  <div class="contact-list">
    {#each contacts as contact (contact.id)}
      <button class="contact" on:click={() => console.log(contact)}>
        <p>{contact.name}</p>
        <p>{contact.email}</p>
      </button>
    {/each}
  </div>
  <div class="chat">hello world</div>
</div>

<style>
  .chat {
    display: flex;
    flex-grow: 1;
  }

  .container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
  }

  .contact-list {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 200px;
    padding: 20px;
    margin-left: 15px;
    margin-right: 15px;
    box-shadow: 0 0 10px black;
    background-color: #333; /* Dark background color */
  }

  .contact {
    cursor: pointer;
    color: white;
    margin-bottom: 15px;
    padding: 10px;
    background-color: #666;
    border-radius: 5px;
    border: none;
    transition: background-color 0.3s ease;
  }

  /* .contact:hover { */
  /* } */
</style>
