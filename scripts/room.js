const activeHotel = JSON.parse(localStorage.getItem('activeHotel'))
if (activeHotel) {
    
    hotelName.textContent = activeHotel.name
    location.textContent = activeHotel.location

} else{
    alert('Hotel details not available')
    setTimeout(() => {
        window.location.href = 'dashboard.html'
    }, 500)
}