document.addEventListener("DOMContentLoaded", function () {
    let choices = ["transparent", "circle"];
    let selected = choices[Math.floor(Math.random() * choices.length)];
    let imgContainer = document.getElementById("image-container");
    let img = document.createElement("img");

    if (selected === "transparent") {
        let randomNum = Math.floor(Math.random() * 9) + 1;
        img.src = `PFP/Transparent/${randomNum}.png`;
        img.classList.add("transparent-img");
    } else {
        let randomNum = Math.floor(Math.random() * 14) + 1;
        img.src = `PFP/Circle/${randomNum}.jpg`;
        img.classList.add("circle-img");
    }

    imgContainer.appendChild(img);
});


    
document.querySelector(".projects-btn").addEventListener("click", function() {
    document.body.style.opacity = "0";
    setTimeout(() => {
        window.location.assign("Projects/index.html");
    }, 500);
});

window.onload = function() {
    document.body.style.opacity = "1";
};
