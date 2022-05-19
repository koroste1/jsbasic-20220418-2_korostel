import createElement from "../../assets/lib/create-element.js";

export default class StepSlider {
  #elem = null;
  #steps = null;
  #value = 0;
  #currentValue = 0;

  constructor({ steps, value = 0 }) {
    this.#steps = steps;
    this.#value = value;
    this.#render();
  }

  get elem() {
    return this.#elem;
  }

  #generateEvent = (value) => {
    const event = new CustomEvent("slider-change", {
      // имя события должно быть именно 'slider-change'
      detail: value, // значение 0, 1, 2, 3, 4
      bubbles: true, // событие всплывает - это понадобится в дальнейшем
    });
    this.elem.dispatchEvent(event);
  };

  #slideEvent = () => {
    const stepsNodes = this.elem.querySelectorAll(".slider__steps>span");

    let thumb = this.elem.querySelector(".slider__thumb");
    let progress = this.elem.querySelector(".slider__progress");
    let sliderValue = this.elem.querySelector(".slider__value");

    thumb.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      this.elem.classList.add("slider_dragging");
      const onMove = ({ clientX }) => {
        let { width, left } = this.elem.getBoundingClientRect();
        let offset = clientX - left;
        let leftRelative = offset / width;

        if (leftRelative < 0) {
          leftRelative = 0;
        }

        if (leftRelative > 1) {
          leftRelative = 1;
        }

        let leftPercents = leftRelative * 100;

        thumb.style.left = `${leftPercents}%`;
        progress.style.width = `${leftPercents}%`;
        let segments = this.#steps - 1;
        let approximateValue = leftRelative * segments;
        let value = Math.round(approximateValue);
        sliderValue.textContent = value;
        stepsNodes.forEach((step) => {
          step.classList.remove("slider__step-active");
        });
        stepsNodes[value].classList.add("slider__step-active");
      };
      document.addEventListener("pointermove", onMove);
      document.addEventListener(
        "pointerup",
        () => {
          let valuePercents =
            (100 / (this.#steps - 1)) * sliderValue.textContent;
          thumb.style.left = `${valuePercents}%`;
          progress.style.width = `${valuePercents}%`;
          this.#generateEvent(+sliderValue.textContent);
          document.removeEventListener("pointermove", onMove);
          this.elem.classList.remove("slider_dragging");
        },
        { once: true }
      );
    });
    this.elem.addEventListener("click", ({ clientX }) => {
      let { width, left } = this.elem.getBoundingClientRect();
      let offset = clientX - left;
      let leftRelative = offset / width;
      let segments = this.#steps - 1;
      let approximateValue = Math.round(leftRelative * segments);

      stepsNodes.forEach((step) => {
        step.classList.remove("slider__step-active");
      });
      stepsNodes[approximateValue].classList.add("slider__step-active");
      let valuePercents = (approximateValue / segments) * 100;
      thumb.style.left = `${valuePercents}%`;
      progress.style.width = `${valuePercents}%`;
      sliderValue.textContent = approximateValue;
      this.#generateEvent(approximateValue);
    });
  };

  #render() {
    this.#elem = createElement(`
    <!--Корневой элемент слайдера-->
    <div class="slider">

      <!--Ползунок слайдера с активным значением-->
      <div class="slider__thumb">
        <span class="slider__value">0</span>
      </div>

      <!--Полоска слайдера-->
      <div class="slider__progress"></div>

      <!-- Шаги слайдера (вертикальные чёрточки) -->
      <div class="slider__steps">
      </div>
    </div>
    `);

    const sliderSteps = this.elem.querySelector(".slider__steps");
    for (let i = 0; i < this.#steps; i++) {
      const span = document.createElement("span");
      sliderSteps.append(span);
      if (i === 0) span.classList.add("slider__step-active");
    }

    this.#slideEvent();
  }
}
