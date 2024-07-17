document.getElementById('formLocal').addEventListener('submit', async (event) => {
  event.preventDefault()
  try {
    const local = document.getElementById('localInput').value
    const response = await fetch('/adicionando_eventos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ local })
    })
    const result = await response.json()
    alert(result.message)
  }
  catch (error) {
    console.log(`Ocorreu um erro ${error}`)
  }
})