document.getElementById("generateBtn").addEventListener("click", () => {
    const min = parseInt(document.getElementById("minLength").value);
    const max = parseInt(document.getElementById("maxLength").value);

    const includeUpper = document.getElementById("includeUppercase").checked;
    const includeSpecial = document.getElementById("includeSpecial").checked;

    const result = document.getElementById("result");

    // Walidacja
    if (isNaN(min) || isNaN(max) || min <= 0 || max < min) {
        result.textContent = "Podaj poprawne wartości długości hasła!";
        return;
    }

    let chars = "abcdefghijklmnopqrstuvwxyz";
    if (includeUpper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeSpecial) chars += "!@#$%^&*()_-+=<>?/{}[]";

    let targetLength = Math.floor(Math.random() * (max - min + 1)) + min;
    let password = "";

    for (let i = 0; i < targetLength; i++) {
        const index = Math.floor(Math.random() * chars.length);
        password += chars[index];
    }

    result.textContent = "Wygenerowane hasło: " + password;
});
