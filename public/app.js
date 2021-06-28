document.querySelectorAll('.price').forEach(node => {
    node.textContent = Intl.NumberFormat('ua-UA', {
        style: 'currency',
        currency: 'uah'
    }).format(node.textContent)
})