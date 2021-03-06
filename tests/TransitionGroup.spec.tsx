import path from "path";
import { setupPlaywright } from "./test-utils";

declare const React: typeof global.React;

describe("TransitionGroup", () => {
  const { page, nextFrame, html, timeout, makeRender } = setupPlaywright();
  const baseUrl = `file://${path.resolve(__dirname, "transition.html")}`;

  const duration = 50;
  const buffer = 5;

  const transitionFinish = (time = duration) => timeout(time + buffer);

  beforeEach(async () => {
    await page().goto(baseUrl);
    await page().waitForSelector("#app", { state: "attached" });
  });

  /* The test is no longer relevant since we use Children.toArray
    and it creates it's own keys
  */
  // it("warn unkeyed children", async () => {
  //   const consoleErrorSpy = jest.spyOn(console, "error");

  //   await page().evaluate(() => {
  //     return new Promise(res => {
  //       const { React, ReactDOM, Retransition } = window as any;
  //       const { Transition, TransitionGroup } = Retransition;
  //       const baseElement = document.querySelector("#app")!;
  //       const arr = [1, 2];

  //       ReactDOM.render(
  //         <TransitionGroup>
  //           {arr.map(v => (
  //             <Transition>
  //               <div id="test">{v}</div>
  //             </Transition>
  //           ))}
  //         </TransitionGroup>,
  //         baseElement,
  //         res
  //       );
  //     });
  //   });

  //   expect(consoleErrorSpy).toBeCalledTimes(1);
  // });

  const render = makeRender(
    ({
      elements,
      transitionProps,
      ...rest
    }: {
      elements: number[];
      [key: string]: any;
    }) => {
      const { TransitionGroup, Transition } = (window as any).Retransition;
      return (
        <TransitionGroup {...rest}>
          {elements.map(v => (
            <Transition key={v} {...transitionProps}>
              <div>{v}</div>
            </Transition>
          ))}
        </TransitionGroup>
      );
    },
    res => {
      debugger;
      return res(document.querySelector("#app")?.innerHTML);
    }
  );

  it("add element", async () => {
    const initialHTML = await render({ elements: [1, 2] });

    expect(initialHTML).toBe(`<div>1</div><div>2</div>`);

    const enterHTML = await render({ elements: [1, 2, 3] });

    expect(enterHTML).toBe(
      `<div>1</div>` +
        `<div>2</div>` +
        `<div class="transition-enter-from transition-enter-active">3</div>`
    );

    await nextFrame();

    expect(await html("#app")).toBe(
      `<div>1</div>` +
        `<div>2</div>` +
        `<div class="transition-enter-active transition-enter-to">3</div>`
    );

    await transitionFinish();

    expect(await html("#app")).toBe(
      `<div>1</div><div>2</div><div class="">3</div>`
    );
  });

  it("remove element", async () => {
    const initialHTML = await render({
      elements: [1, 2, 3],
    });
    expect(initialHTML).toBe(`<div>1</div><div>2</div><div>3</div>`);

    const leaveHTML = await render({
      elements: [1, 2],
    });

    expect(leaveHTML).toBe(
      `<div>1</div>` +
        `<div>2</div>` +
        `<div class="transition-leave-from transition-leave-active">3</div>`
    );

    await nextFrame();

    expect(await html("#app")).toBe(
      `<div>1</div>` +
        `<div>2</div>` +
        `<div class="transition-leave-active transition-leave-to">3</div>`
    );

    await transitionFinish();

    expect(await html("#app")).toBe(`<div>1</div><div>2</div>`);
  });

  it.skip("add + remove", async () => {
    const initialHTML = await render({
      elements: [1, 2, 3],
    });
    expect(initialHTML).toBe(`<div>1</div><div>2</div><div>3</div>`);

    const newHTML = await render({
      elements: [2, 3, 4],
    });

    expect(newHTML).toBe(
      `<div class="transition-leave-from transition-leave-active">1</div>` +
        `<div>2</div>` +
        `<div class="transition-leave-from transition-leave-active">3</div>`
    );

    await nextFrame();

    expect(await html("#app")).toBe(
      `<div>1</div>` +
        `<div>2</div>` +
        `<div class="transition-leave-active transition-leave-to">3</div>`
    );

    await transitionFinish();

    expect(await html("#app")).toBe(`<div>1</div><div>2</div>`);
  });

  it("enter + move", async () => {
    const initialHTML = await render({
      elements: [1, 3],
    });
    expect(initialHTML).toBe(`<div>1</div><div>3</div>`);

    const enterHTML = await render({
      elements: [1, 2, 3],
    });

    expect(enterHTML).toBe(
      `<div>1</div>` +
        `<div class="transition-enter-from transition-enter-active">2</div>` +
        `<div class="transition-move" style="">3</div>`
    );

    await nextFrame();

    expect(await html("#app")).toBe(
      `<div>1</div>` +
        `<div class="transition-enter-active transition-enter-to">2</div>` +
        `<div class="transition-move" style="">3</div>`
    );

    await transitionFinish();

    expect(await html("#app")).toBe(
      `<div>1</div><div class="">2</div><div class="" style="">3</div>`
    );
  });

  it("remove + move", async () => {
    const initialHTML = await render({
      elements: [1, 2, 3],
    });
    expect(initialHTML).toBe(`<div>1</div><div>2</div><div>3</div>`);

    const leaveHTML = await render({
      elements: [1, 3],
    });

    expect(leaveHTML).toBe(
      `<div>1</div>` +
        `<div class="transition-leave-from transition-leave-active">2</div>` +
        `<div class="transition-move" style="">3</div>`
    );

    await nextFrame();

    expect(await html("#app")).toBe(
      `<div>1</div>` +
        `<div class="transition-leave-active transition-leave-to">2</div>` +
        `<div class="transition-move" style="">3</div>`
    );

    // for some reason it's not passing with `transitionFinish` in ci
    await timeout(duration * 2);

    expect(await html("#app")).toBe(
      `<div>1</div><div class="" style="">3</div>`
    );
  });

  it("appear passed to TransitionGroup", async () => {
    const appearHTML = await render({
      elements: [1, 2],
      appear: true,
      transitionProps: {
        appearFromClass: "transition-appear-from",
        appearActiveClass: "transition-appear-active",
        appearToClass: "transition-appear-to",
      },
    });

    expect(appearHTML).toBe(
      `<div class="transition-appear-from transition-appear-active">1</div>` +
        `<div class="transition-appear-from transition-appear-active">2</div>`
    );

    await nextFrame();

    expect(await html("#app")).toBe(
      `<div class="transition-appear-active transition-appear-to">1</div>` +
        `<div class="transition-appear-active transition-appear-to">2</div>`
    );

    await transitionFinish();

    expect(await html("#app")).toBe(
      `<div class="">1</div>` + `<div class="">2</div>`
    );

    // enter
    const enterHTML = await render({
      elements: [1, 2, 3],
    });

    expect(enterHTML).toBe(
      `<div class="">1</div>` +
        `<div class="">2</div>` +
        `<div class="transition-enter-from transition-enter-active">3</div>`
    );

    await nextFrame();

    expect(await html("#app")).toBe(
      `<div class="">1</div>` +
        `<div class="">2</div>` +
        `<div class="transition-enter-active transition-enter-to">3</div>`
    );

    await transitionFinish();

    expect(await html("#app")).toBe(
      `<div class="">1</div>` +
        `<div class="">2</div>` +
        `<div class="">3</div>`
    );

    // leave
    const leaveHTML = await render({
      elements: [1, 2],
    });

    expect(leaveHTML).toBe(
      `<div class="">1</div>` +
        `<div class="">2</div>` +
        `<div class="transition-leave-from transition-leave-active">3</div>`
    );

    await nextFrame();

    expect(await html("#app")).toBe(
      `<div class="">1</div>` +
        `<div class="">2</div>` +
        `<div class="transition-leave-active transition-leave-to">3</div>`
    );

    await transitionFinish();

    expect(await html("#app")).toBe(
      `<div class="">1</div>` + `<div class="">2</div>`
    );
  });

  it("appear passed to each Transition", async () => {
    const appearHTML = await render({
      elements: [1, 2],
      transitionProps: {
        appear: true,
        appearFromClass: "transition-appear-from",
        appearActiveClass: "transition-appear-active",
        appearToClass: "transition-appear-to",
      },
    });

    expect(appearHTML).toBe(
      `<div class="transition-appear-from transition-appear-active">1</div>` +
        `<div class="transition-appear-from transition-appear-active">2</div>`
    );

    await nextFrame();

    expect(await html("#app")).toBe(
      `<div class="transition-appear-active transition-appear-to">1</div>` +
        `<div class="transition-appear-active transition-appear-to">2</div>`
    );

    await transitionFinish();

    expect(await html("#app")).toBe(
      `<div class="">1</div>` + `<div class="">2</div>`
    );

    // enter
    const enterHTML = await render({
      elements: [1, 2, 3],
    });

    expect(enterHTML).toBe(
      `<div class="">1</div>` +
        `<div class="">2</div>` +
        `<div class="transition-enter-from transition-enter-active">3</div>`
    );

    await nextFrame();

    expect(await html("#app")).toBe(
      `<div class="">1</div>` +
        `<div class="">2</div>` +
        `<div class="transition-enter-active transition-enter-to">3</div>`
    );

    await transitionFinish();

    expect(await html("#app")).toBe(
      `<div class="">1</div>` +
        `<div class="">2</div>` +
        `<div class="">3</div>`
    );

    // leave
    const leaveHTML = await render({
      elements: [1, 2],
    });

    expect(leaveHTML).toBe(
      `<div class="">1</div>` +
        `<div class="">2</div>` +
        `<div class="transition-leave-from transition-leave-active">3</div>`
    );

    await nextFrame();

    expect(await html("#app")).toBe(
      `<div class="">1</div>` +
        `<div class="">2</div>` +
        `<div class="transition-leave-active transition-leave-to">3</div>`
    );

    await transitionFinish();

    expect(await html("#app")).toBe(
      `<div class="">1</div>` + `<div class="">2</div>`
    );
  });

  it("prioritize child appear", async () => {
    const appearHTML = await render({
      elements: [1, 2],
      appear: false,
      transitionProps: {
        appear: true,
        appearFromClass: "transition-appear-from",
        appearActiveClass: "transition-appear-active",
        appearToClass: "transition-appear-to",
      },
    });

    expect(appearHTML).toBe(
      `<div class="transition-appear-from transition-appear-active">1</div>` +
        `<div class="transition-appear-from transition-appear-active">2</div>`
    );

    await nextFrame();

    expect(await html("#app")).toBe(
      `<div class="transition-appear-active transition-appear-to">1</div>` +
        `<div class="transition-appear-active transition-appear-to">2</div>`
    );

    await transitionFinish();

    expect(await html("#app")).toBe(
      `<div class="">1</div>` + `<div class="">2</div>`
    );

    // enter
    const enterHTML = await render({
      elements: [1, 2, 3],
    });

    expect(enterHTML).toBe(
      `<div class="">1</div>` +
        `<div class="">2</div>` +
        `<div class="transition-enter-from transition-enter-active">3</div>`
    );

    await nextFrame();

    expect(await html("#app")).toBe(
      `<div class="">1</div>` +
        `<div class="">2</div>` +
        `<div class="transition-enter-active transition-enter-to">3</div>`
    );

    await transitionFinish();

    expect(await html("#app")).toBe(
      `<div class="">1</div>` +
        `<div class="">2</div>` +
        `<div class="">3</div>`
    );

    // leave
    const leaveHTML = await render({
      elements: [1, 2],
    });

    expect(leaveHTML).toBe(
      `<div class="">1</div>` +
        `<div class="">2</div>` +
        `<div class="transition-leave-from transition-leave-active">3</div>`
    );

    await nextFrame();

    expect(await html("#app")).toBe(
      `<div class="">1</div>` +
        `<div class="">2</div>` +
        `<div class="transition-leave-active transition-leave-to">3</div>`
    );

    await transitionFinish();

    expect(await html("#app")).toBe(
      `<div class="">1</div>` + `<div class="">2</div>`
    );
  });

  it("`moveTransition: false` should not add move classes", async () => {
    const initialHTML = await render({
      elements: [1, 3],
      name: "transition",
      moveTransition: false,
    });
    expect(initialHTML).toBe(`<div>1</div><div>3</div>`);

    const enterHTML = await render({
      elements: [1, 2, 3],
    });

    expect(enterHTML).toBe(
      `<div>1</div>` +
        `<div class="transition-enter-from transition-enter-active">2</div>` +
        `<div>3</div>`
    );

    await nextFrame();

    expect(await html("#app")).toBe(
      `<div>1</div>` +
        `<div class="transition-enter-active transition-enter-to">2</div>` +
        `<div>3</div>`
    );

    await transitionFinish();

    expect(await html("#app")).toBe(
      `<div>1</div><div class="">2</div><div>3</div>`
    );
  });

  // it('child appear false + transition appear true')

  it.todo("should not update if props and children keys are the same");
});
