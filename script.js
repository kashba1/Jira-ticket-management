let addBtn = document.querySelector(".add-btn");
let removeBtn = document.querySelector(".remove-btn");
let modalCont = document.querySelector(".modal-cont");
let mainCont = document.querySelector(".main-cont");
let textAreaCont = document.querySelector(".textarea-cont");
let allPriorityColors = document.querySelectorAll(".priority-color");
let toolBoxColors = document.querySelectorAll(".color");

let colors = ["lightpink", "lightblue", "lightgreen", "black"];
let modalPriorityColor = colors[colors.length - 1];

let addFlag = false;
let removeFlag = false;

let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";

let ticketsArr = [];

if(localStorage.getItem("jira_tickets")){
    ticketsArr = JSON.parse(localStorage.getItem("jira_tickets"));
    ticketsArr.forEach((ticketObj) => {
        createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID);
    })
}


for(let i = 0; i < toolBoxColors.length; i++){
    toolBoxColors[i].addEventListener(("click"), (e) => {
        let currentToolBoxColor = toolBoxColors[i].classList[0];
        let filteredTickets = ticketsArr.filter((ticketObj, idx) => {
            return currentToolBoxColor === ticketObj.ticketColor;
        })

        //remove prev tickets
        let allTicketsCont = document.querySelectorAll(".ticket-cont");
        for(let i = 0; i < allTicketsCont.length; i++){
            allTicketsCont[i].remove();
        }

        //display new filtered ticktes
        filteredTickets.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID);
        })
    });

    toolBoxColors[i].addEventListener("dblclick", (e) => {
        let allTicketsCont = document.querySelectorAll(".ticket-cont");
        for(let i = 0; i < allTicketsCont.length; i++){
            allTicketsCont[i].remove();
        }
        ticketsArr.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID);
        });
    })
}

//listener for modal priority coloring
allPriorityColors.forEach((colorElem, idx) => {
    colorElem.addEventListener("click", (e) => {
        allPriorityColors.forEach((priorityColorElem, idx) => {
            priorityColorElem.classList.remove("border");
        })
        colorElem.classList.add("border");
        modalPriorityColor = colorElem.classList[0];
    })
})

addBtn.addEventListener("click", (e) => {
    // display modal
    // generate ticket

    // addFlag, true => display modal
    // addFlag, false => none modal
    addFlag = !addFlag;
    if(addFlag){
        modalCont.style.display = "flex";
    }else{
        modalCont.style.display = "none";
    }
});

modalCont.addEventListener("keydown", (e) => {
    let key = e.key;
    if(key === "Shift"){
        createTicket(modalPriorityColor, textAreaCont.value);
        addFlag = !addFlag;
        setModalToDefault();
    }
})

removeBtn.addEventListener("click", (e) => {
    removeFlag = !removeFlag;
});

function createTicket(ticketColor, ticketTask, ticketID){
    let id = ticketID || shortid();
    let ticketCont = document.createElement("div");
    ticketCont.setAttribute("class", "ticket-cont");
    ticketCont.innerHTML = `
        <div class="ticket-color ${ticketColor}"></div>
        <div class="ticket-id">
            #${id}
        </div>
        <div class="task-area">
            ${ticketTask}
        </div>
        <div class="ticket-lock">
            <i class="fas fa-lock"></i>
        </div>
    `
    mainCont.appendChild(ticketCont);

    //create obj of ticket & add to array
    if(!ticketID) {
        ticketsArr.push({ticketColor, ticketTask, ticketID: id});
        localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
    }


    handleRemoval(ticketCont, id);
    handleLock(ticketCont, id);
    handleColor(ticketCont, id);
}

function handleRemoval(ticket, id){
    //removeFlag = true => remove ticket

    ticket.addEventListener("click", (e) => {
        if(removeFlag){
            //DB removal
            let ticketIdx = getTicketIdx(id);
            ticketsArr.splice(ticketIdx, 1);
            localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));

            // UI removal
            ticket.remove();
        }
    })
}

function handleLock(ticket, id){
    let ticketLockElem = ticket.querySelector(".ticket-lock");
    let ticketLock = ticketLockElem.children[0];
    let ticketTaskArea = ticket.querySelector(".task-area");
    ticketLock.addEventListener("click", (e) => {
        let ticketIdx = getTicketIdx(id);
        if(ticketLock.classList.contains(lockClass)){
            ticketLock.classList.remove(lockClass);
            ticketLock.classList.add(unlockClass);
            ticketTaskArea.setAttribute("contenteditable", "true");
        }else{
            ticketLock.classList.remove(unlockClass);
            ticketLock.classList.add(lockClass);
            ticketTaskArea.setAttribute("contenteditable", "false");
        }

        //modify data in local storage (Ticket task)
        ticketsArr[ticketIdx].ticketTask = ticketTaskArea.innerHTML;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
    })
}


function handleColor(ticket, id){
    let ticketColor = ticket.querySelector(".ticket-color");
    ticketColor.addEventListener("click", (e) => {
        let ticketIdx = getTicketIdx(id);

        let currentTicketColor = ticketColor.classList[1];
        let currentTicketColorIndex = colors.findIndex((color) => {
            return currentTicketColor === color;
        })
        //changing in UI
        currentTicketColorIndex = (currentTicketColorIndex + 1) % colors.length;
        let newTicketColor = colors[currentTicketColorIndex];
        ticketColor.classList.remove(currentTicketColor);
        ticketColor.classList.add(newTicketColor);

        //modified data in local storage
        ticketsArr[ticketIdx].ticketColor = newTicketColor;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
    })

}

function getTicketIdx(id){
    let currTicketObjIdx = ticketsArr.findIndex((ticketObj) => {
        return ticketObj.ticketID === id;
    })
    return currTicketObjIdx;
}

function setModalToDefault(){
    allPriorityColors.forEach((priorityColorElem, idx) => {
        priorityColorElem.classList.remove("border");
    })
    allPriorityColors[allPriorityColors.length - 1].classList.add("border");
    modalCont.style.display = "none";
    textAreaCont.value = ""; 
    modalPriorityColor = colors[colors.length - 1];
}