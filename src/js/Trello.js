import CardStorage from "./CardStorage";

export default class Trello {
  constructor() {
    this.container = document.querySelector(".container");
    this.todoList = document.getElementById("todo").querySelector(".cards");
    this.progressList = document
      .getElementById("progress")
      .querySelector(".cards");
    this.doneList = document.getElementById("done").querySelector(".cards");
    this.forms = Array.from(document.forms);
    this.parent = null;
    this.draggedEl = null;
    this.phantomEl = null;
  }

  action() {
    document.addEventListener("DOMContentLoaded", () => {
      this.load();
    });
    this.container.addEventListener("mousedown", (e) => {
      if (e.target.classList.contains("add-card")) {
        const targetForm = e.target.parentElement.querySelector(".card-form");
        if (!targetForm.classList.contains("card-form-active")) {
          targetForm.classList.add("card-form-active");
        }
      } else if (e.target.classList.contains("cancel-button")) {
        e.preventDefault();
        const targetForm = e.target.closest(".card-form");
        targetForm.reset();
        targetForm.classList.remove("card-form-active");
      } else if (e.target.classList.contains("delete-button-active")) {
        e.preventDefault();
        const deleteCard = e.target.parentElement;
        e.target.closest(".cards").removeChild(deleteCard);
        this.save();
      } else if (e.target.classList.contains("card-item")) {
        e.preventDefault();
        e.target
          .querySelector(".delete-button")
          .classList.remove("delete-button-active");
        e.target.classList.remove("card-item-active");
        this.draggedEl = e.target;
        this.phantomEl = e.target.cloneNode(true);
        this.phantomEl.classList.add("dragged");
        document.body.append(this.phantomEl);
        document.body.style.cursor = "grabbing";
        this.phantomEl.style.width = `${this.draggedEl.offsetWidth - 33}px`;
        this.phantomEl.style.left = `${e.pageX - this.phantomEl.offsetWidth / 2}px`;
        this.phantomEl.style.top = `${e.pageY - this.phantomEl.offsetHeight / 2}px`;
      }
    });
    this.container.addEventListener("mouseover", (e) => {
      e.preventDefault();
      if (this.draggedEl) return;
      if (e.target.classList.contains("card-item")) {
        const targetCard = e.target;
        targetCard.classList.add("card-item-active");
        targetCard
          .querySelector(".delete-button")
          .classList.add("delete-button-active");
      }
    });
    this.container.addEventListener("mouseout", (e) => {
      e.preventDefault();
      if (
        e.target.classList.contains("card-item") &&
        !e.relatedTarget.classList.contains("delete-button")
      ) {
        const targetCard = e.target;
        targetCard.classList.remove("card-item-active");
        targetCard
          .querySelector(".delete-button")
          .classList.remove("delete-button-active");
      }
    });
    this.container.addEventListener("mousemove", (e) => {
      e.preventDefault();
      if (this.draggedEl) {
        this.phantomEl.style.left = `${e.pageX - this.phantomEl.offsetWidth / 2}px`;
        this.phantomEl.style.top = `${e.pageY - this.phantomEl.offsetHeight / 2}px`;
      }
    });
    this.container.addEventListener("mouseup", (e) => {
      if (this.draggedEl) {
        const target = document.elementFromPoint(e.clientX, e.clientY);
        const { top } = target.getBoundingClientRect();
        const parent = target.closest(".cards");
        if (parent && parent !== target) {
          if (e.pageY > window.scrollY + top + target.offsetHeight / 2) {
            parent.insertBefore(this.draggedEl, target.nextElementSibling);
          } else {
            parent.insertBefore(this.draggedEl, target);
          }
          this.stopMove();
          this.save();
        } else if (parent) {
          parent.append(this.draggedEl);
          this.stopMove();
          this.save();
        } else {
          this.stopMove();
          this.save();
        }
      }
    });
    this.forms.forEach((element) => {
      element.addEventListener("submit", (e) => {
        e.preventDefault();
        const isValid = e.currentTarget.checkValidity();
        const input = [...element.elements][0];
        if (isValid) {
          const targetList = element
            .closest(".container-column")
            .querySelector(".cards");
          this.addCard(targetList, input.value);
          element.reset();
          element.classList.remove("card-form-active");
          this.save();
        }
      });
    });
  }

  addCard(parent, value) {
    this.parent = parent;
    const card = document.createElement("div");
    card.className = "card-item";
    card.innerHTML = `${value} <span class='delete-button'>✕</span>`;
    this.parent.append(card);
  }

  save() {
    const todoCards = this.todoList.querySelectorAll(".card-item");
    const progressCards = this.progressList.querySelectorAll(".card-item");
    const doneCards = this.doneList.querySelectorAll(".card-item");

    const data = {
      todo: [],
      progress: [],
      done: [],
    };

    todoCards.forEach((element) => {
      data.todo.push(element.textContent.replace(" ✕", ""));
    });

    progressCards.forEach((element) => {
      data.progress.push(element.textContent.replace(" ✕", ""));
    });

    doneCards.forEach((element) => {
      data.done.push(element.textContent.replace(" ✕", ""));
    });

    CardStorage.save(data);
  }

  load() {
    const data = JSON.parse(CardStorage.load());
    if (data) {
      data.todo.forEach((element) => {
        this.addCard(this.todoList, element);
      });
      data.progress.forEach((element) => {
        this.addCard(this.progressList, element);
      });
      data.done.forEach((element) => {
        this.addCard(this.doneList, element);
      });
    }
  }
  stopMove() {
    document.body.removeChild(this.phantomEl);
    document.body.style.cursor = "auto";
    this.phantomEl = null;
    this.draggedEl = null;
  }
}
