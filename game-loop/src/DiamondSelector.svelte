<script>
    import { onMount, onDestroy, createEventDispatcher } from "svelte";
    let selected = 0;
    const dispatch = createEventDispatcher();
    const diamonds = [0, 1, 2];

    function selectDiamond(idx) {
        selected = idx;
        dispatch("select", selected);
    }

    function handleGlobalKeydown(e) {
        if (e.code === "Numpad1") selectDiamond(0);
        if (e.code === "Numpad2") selectDiamond(1);
        if (e.code === "Numpad3") selectDiamond(2);
    }

    onMount(() => {
        window.addEventListener("keydown", handleGlobalKeydown);
    });
    onDestroy(() => {
        window.removeEventListener("keydown", handleGlobalKeydown);
    });
</script>

<div class="diamond-container">
    {#each diamonds as idx}
        <svg
            class="diamond {selected === idx ? 'selected' : ''}"
            viewBox="0 0 40 40"
            role="button"
            tabindex="0"
            aria-label={`Select diamond ${idx + 1}`}
            onclick={() => selectDiamond(idx)}
            onkeydown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    selectDiamond(idx);
                }
            }}
        >
            <polygon
                points="20,0 40,20 20,40 0,20"
                fill="#eee"
                stroke="#888"
                stroke-width="2"
            />
        </svg>
    {/each}
</div>

<style>
    .diamond-container {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 4rem;
        margin: 2rem 0;
    }
    .diamond {
        width: 40px;
        height: 40px;
        cursor: pointer;
        transition: box-shadow 0.2s;
        box-shadow: 0 0 0 2px #ccc;
    }
    .diamond.selected {
        box-shadow: 0 0 0 4px #00bfff;
    }
</style>
