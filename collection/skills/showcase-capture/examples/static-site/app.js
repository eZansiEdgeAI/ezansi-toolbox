const button = document.querySelector('[data-action="features"]')
const cards = document.querySelectorAll('.card')

button?.addEventListener('click', () => {
  document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })
  cards.forEach((card, index) => {
    window.setTimeout(() => card.classList.add('is-visible'), index * 120)
  })
})
