// Ładowanie nagłówka i stopki z osobnych plików HTML
document.addEventListener("DOMContentLoaded", function() {
    function loadComponent(elementId, filePath) {
        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Nie udało się wczytać pliku: ${filePath}`);
                }
                return response.text();
            })
            .then(data => {
                document.getElementById(elementId).innerHTML = data;
            })
            .catch(error => console.error('Błąd:', error));
    }

    loadComponent('place-header', 'header.html');
    loadComponent('place-footer', 'footer.html');
});

// Odliczanie na głównej stronie
function startCountdown() {
    const clockElement = document.getElementById('digital-clock');

    if (clockElement) {
        const targetDate = new Date("2025-12-01T09:00:00").getTime();

        function updateTimer() {
            const now = new Date().getTime();
            const distance = targetDate - now;

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if (distance < 0) {
                clockElement.textContent = "We are OPEN!";
                clockElement.style.color = "#ff6b6b";
            } else {
                clockElement.textContent =
                    `${days}d ${hours}h ${minutes}m ${seconds}s`;
            }
        }

        updateTimer();
        setInterval(updateTimer, 1000); //odswiezanie co sekunde
    }
}

startCountdown();


// Odtwarzanie video - wybor fragmentu i automatyczne zatrzymanie
const video = document.getElementById('myVideo');
if (video) {
    const startTime = 30;
    const endTime = 45;

    video.addEventListener('loadedmetadata', () => {
        video.currentTime = startTime;
    });

    video.addEventListener('timeupdate', () => {
        if(video.currentTime >= endTime) {
            video.pause();
        }
    });
}

//Walidacja formularza
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();

        //pobieranie elementow
        const emailField = document.getElementById('email');
        const messageField = document.getElementById('message');
        const errorContainer = document.getElementById('error-container');

        let errors = []; // Zapisywanie bledow w tablicy

        // Walidacja Emaila
        if (!emailField.value.includes('@') || !emailField.value.includes('.')) {
            errors.push("Please enter a valid email address.");
            emailField.classList.add('input-error');
        } else {
            emailField.classList.remove('input-error');
        }

        // Walidacja wiadomosci (min. 10 znaków)
        if (messageField.value.length < 10) {
            errors.push("Message must be at least 10 characters long.");
            messageField.classList.add('input-error');
        } else {
            messageField.classList.remove('input-error');
        }

        // Walidacja Captcha - według dokumentacji Google reCAPTCHA
        const captchaResponse = grecaptcha.getResponse();
        if (captchaResponse.length === 0) {
            errors.push("Please confirm you are not a robot.");
        }

        if (errors.length > 0) {
            // Błędy
            errorContainer.innerHTML = errors.join('<br>');
            errorContainer.style.display = 'block';
        } else {
            // OK
            errorContainer.style.display = 'none';
            alert("Message sent successfully! (Demo)");
            contactForm.reset();
            grecaptcha.reset();
        }
    });
}
