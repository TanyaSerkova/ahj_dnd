export default class CardStorage {
  static save(data) {
    localStorage.setItem("cards", JSON.stringify(data));
  }
  static load() {
    return localStorage.getItem("cards");
  }
}
