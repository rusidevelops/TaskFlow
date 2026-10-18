let items = [];
let taskCount = 0;

const itemsDIv = document.getElementById("items")
const input = document.getElementById("itemInput")
const storageKey = "items"; 

function loadItems() {
    const oldItems = localStorage.getItem(storageKey)
    if (oldItems) items = JSON.parse(oldItems)
    renderItems()
}

function saveItems() {
    const stringItems = JSON.stringify(items);
    localStorage.setItem(storageKey, stringItems)
}

function renderItems() {
    itemsDIv.innerHTML = "";

    for (const [idx, item] of Object.entries(items)) {
        const container = document.createElement("div")
        container.className = "container"
        container.style.marginBottom = "20px"

        const text = document.createElement("p")
        text.style.display = "inline"
        text.style.marginRight = "10px"
        text.textContent = item;

        const button = document.createElement("button")
        button.textContent = "X"
        button.className = "deleteButton";
        button.onclick = () => removeItems(idx)

        container.addEventListener("keydown", (e) => {
            if (e.key === "Delete" || e.key === "Backspace") {
                removeItems(idx);
            }
        });

        container.appendChild(text)
        container.appendChild(button)

        itemsDIv.appendChild(container)
    }
}




function addItem() {
    const value = input.value;
    if (!value) {
        alert("You cannot add an empty item")
        return
    }
    items.push(value)
    renderItems()
    input.value = ""
    saveItems()
    }

function removeItems(idx) {
    items.splice(idx, 1)
    renderItems()
    saveItems()
}
document.addEventListener("DOMContentLoaded", loadItems)

input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addItem();
});