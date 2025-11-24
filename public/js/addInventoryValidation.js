// Client-Side Validation: Add Inventory Form

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("addInventoryForm")
    if (!form) return
  
    form.addEventListener("submit", (event) => {
      const year = document.getElementById("inv_year").value.trim()
      const price = document.getElementById("inv_price").value.trim()
      const miles = document.getElementById("inv_miles").value.trim()
      const desc = document.getElementById("inv_description").value.trim()
  
      // Year validation (must be 4 digits)
      if (!/^\d{4}$/.test(year)) {
        alert("Year must be a 4-digit number.")
        event.preventDefault()
        return
      }
  
      // Price must be > 0
      if (isNaN(price) || Number(price) <= 0) {
        alert("Price must be a positive number.")
        event.preventDefault()
        return
      }
  
      // Miles must be >= 0
      if (isNaN(miles) || Number(miles) < 0) {
        alert("Miles must be zero or greater.")
        event.preventDefault()
        return
      }
  
      // Description must be 10+ characters
      if (desc.length < 10) {
        alert("Description must be at least 10 characters.")
        event.preventDefault()
      }
    })
})
  