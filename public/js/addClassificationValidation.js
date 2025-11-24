// Client-Side Validation: Add Classification Form

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("addClassificationForm")
    if (!form) return
  
    form.addEventListener("submit", (event) => {
      const input = document.getElementById("classification_name")
      const value = input.value.trim()
  
      // Must be at least 3 letters and only alphabetic
      const regex = /^[A-Za-z]{3,}$/
  
      if (!regex.test(value)) {
        alert("Classification must be at least 3 letters and contain only A-Z.")
        input.focus()
        event.preventDefault()
      }
    })
})