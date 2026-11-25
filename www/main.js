let items = [];
let taskCount = 0;

const itemsDIv = document.getElementById("items");
const input = document.getElementById("itemInput");
const storageKey = "items";

function loadItems() {
    const oldItems = localStorage.getItem(storageKey);
    if (oldItems) items = JSON.parse(oldItems);
    renderItems();
}

function saveItems() {
    const stringItems = JSON.stringify(items);
    localStorage.setItem(storageKey, stringItems);
}

function renderItems() {
    itemsDIv.innerHTML = "";

    for (const [idx, item] of Object.entries(items)) {
        const container = document.createElement("div");
        container.className = "container";
        container.style.marginBottom = "20px";

        const text = document.createElement("p");
        text.style.display = "inline";
        text.style.marginRight = "10px";

        const tagMatch = item.match(/#\w+/);

        if (tagMatch) {
            const tag = tagMatch[0];
            const cleanTag = tag.toLowerCase().replace("#", "").trim();
            const cleanTitle = item.replace(tag, "").trim();

            const tagSpan = document.createElement("span");
            tagSpan.textContent = tag;
            tagSpan.className = `task-tag tag-${cleanTag}`;
            if (!["school", "work", "personal", "urgent", "task"].includes(cleanTag)) {
                tagSpan.className = "task-tag tag-default";
            }

            text.appendChild(tagSpan);

            const titleSpan = document.createElement("span");
            titleSpan.textContent = cleanTitle;
            text.appendChild(titleSpan);
        } else {
            text.textContent = item;
        }

        const button = document.createElement("button");
        button.textContent = "X";
        button.className = "deleteButton";
        button.onclick = () => removeItems(idx);

        container.addEventListener("keydown", (e) => {
            if (e.key === "Delete" || e.key === "Backspace") {
                removeItems(idx);
            }
        });

        container.appendChild(text);
        container.appendChild(button);

        itemsDIv.appendChild(container);
    }
}

function addItem() {
    const value = input.value;
    if (!value) {
        alert("You cannot add an empty item");
        return;
    }
    items.push(value);
    renderItems();
    input.value = "";
    saveItems();
}

function removeItems(idx) {
    items.splice(idx, 1);
    renderItems();
    saveItems();
}

function setupGuideDownload() {
    const guideLink =
        document.getElementById("guideDownload") ||
        document.querySelector("a.PDFinstaller");
    if (!guideLink) return;

    guideLink.addEventListener("click", async (event) => {
        const cap = window.Capacitor;

        if (!cap || typeof cap.isNativePlatform !== "function" || !cap.isNativePlatform()) {
            return;
        }

        event.preventDefault();

        const pdfPath = guideLink.getAttribute("href") || "guide.pdf";
        const fileName = guideLink.getAttribute("download") || "TaskFlow-Guide.pdf";

        const Filesystem = cap.Plugins?.Filesystem;
        const FileOpener = cap.Plugins?.FileOpener;

        if (!Filesystem || !FileOpener) {
            alert("Missing Capacitor Filesystem or FileOpener plugin. Run `npx cap sync android` and rebuild.");
            return;
        }

        try {
            const response = await fetch(pdfPath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} while loading ${pdfPath}`);
            }

            const blob = await response.blob();
            const base64Data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = String(reader.result || "");
                    resolve(result.includes(",") ? result.split(",")[1] : result);
                };
                reader.onerror = () => reject(reader.error);
                reader.readAsDataURL(blob);
            });

            const savedFile = await Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: "CACHE"
            });

            await FileOpener.openFile({
                path: savedFile.uri,
                mimeType: "application/pdf"
            });
        } catch (err) {
            console.error("Failed to open TaskFlow guide:", err);
            alert("Could not open the PDF guide on this device.");
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadItems();
    setupGuideDownload();
});

input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addItem();
});