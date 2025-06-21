document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("noResults").style.display = "none";
});

async function extractTextFromPDF(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async function () {
            const typedarray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let text = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                let page = await pdf.getPage(i);
                let textContent = await page.getTextContent();
                text += textContent.items.map((item) => item.str).join(" ") + " ";
            }
            resolve(text.toLowerCase());
        };
        reader.readAsArrayBuffer(file);
    });
}

async function searchResumes() {
    const keyword = document.getElementById("keywordInput").value.toLowerCase();
    const fileInput = document.getElementById("resumeInput");
    const resultsList = document.getElementById("results");
    const noResultsMessage = document.getElementById("noResults");
    
    resultsList.innerHTML = "";
    noResultsMessage.style.display = "none";
    resultsList.classList.remove("fade-in");
    noResultsMessage.classList.remove("shake");
    
    if (!fileInput.files.length) {
        alert("Please upload resumes first.");
        return;
    }
    
    let found = false;
    let filePromises = [];
    
    for (const file of fileInput.files) {
        if (file.type === "application/pdf") {
            filePromises.push(
                extractTextFromPDF(file).then((text) => {
                    if (text.includes(keyword)) {
                        const listItem = document.createElement("li");
                        listItem.textContent = file.name;
                        resultsList.appendChild(listItem);
                        found = true;
                    }
                })
            );
        }
    }
    
    Promise.all(filePromises).then(() => {
        if (found) {
            resultsList.classList.add("fade-in");
        } else {
            noResultsMessage.style.display = "block";
            noResultsMessage.classList.add("shake");
        }
    });
}
