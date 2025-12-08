const tableBody = document.getElementById("tableBody");
const filterInput = document.getElementById("filterInput");
const sortSelect = document.getElementById("sortSelect");

let products = [];
let originalProducts = [];

fetch("https://dummyjson.com/products")
    .then(res => res.json())
    .then(data => {
        products = data.products.slice(0, 30);
        originalProducts = [...products];
        renderTable(products);
    });

function renderTable(data) {
    tableBody.innerHTML = "";
    data.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
      <td><img src="${item.thumbnail}" /></td>
      <td>${item.title}</td>
      <td>${item.description}</td>
    `;
        tableBody.appendChild(row);
    });
}

filterInput.addEventListener("input", () => {
    applyFilters();
});

sortSelect.addEventListener("change", () => {
    applyFilters();
});

function applyFilters() {
    let filtered = originalProducts.filter(p =>
        p.title.toLowerCase().includes(filterInput.value.toLowerCase()) ||
        p.description.toLowerCase().includes(filterInput.value.toLowerCase())
    );

    if (sortSelect.value === "asc") {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortSelect.value === "desc") {
        filtered.sort((a, b) => b.title.localeCompare(a.title));
    }

    renderTable(filtered);
}
