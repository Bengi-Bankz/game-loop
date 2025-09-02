<script lang="ts">
    import Game from "./Game.svelte";
</script>

<div class="overlay-ui">
    <Game />
</div>

<style>
    .overlay-ui {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: auto;
        z-index: 10;
    }
</style>
