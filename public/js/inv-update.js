// Enable the Update button ONLY when something changes
const form = document.querySelector("#updateForm")

form.addEventListener("change", function () {
  const updateBtn = document.querySelector("button")
  if (updateBtn) {
    updateBtn.removeAttribute("disabled")
  }
})
