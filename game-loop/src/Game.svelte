<script lang="ts">
    import { onMount } from "svelte";
    import { writable } from "svelte/store";

    const API_MULTIPLIER = 1000000;
    const gamestate = writable("rest");
    const response = writable<any>(null);
    const endRoundResponse = writable<any>(null);
    const balance = writable(1000);
    const lastWin = writable(0);

    const getParam = (key: string) =>
        new URLSearchParams(window.location.search).get(key);
    async function getRGSResponse(endpoint: string, body: any): Promise<any> {
        const res = await fetch(`https://${getParam("rgs_url")}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        return res.json();
    }

    onMount(async () => {
        const res = await getRGSResponse("/wallet/authenticate", {
            sessionID: getParam("sessionID"),
            language: getParam("language") || "en",
        });
        balance.set(res.balance.amount / API_MULTIPLIER);
        console.log("loaded..");
    });

    const endRound = async () => {
        const confirmation = await getRGSResponse("/wallet/end-round", {
            sessionID: getParam("sessionID"),
        });
        balance.set(confirmation.balance.amount / API_MULTIPLIER);
        endRoundResponse.set(confirmation);
        if (confirmation?.balance.amount != null) {
            gamestate.set("rest");
        }
    };

    async function getBookResponse() {
        let gs;
        gamestate.subscribe((value) => (gs = value))();
        if (gs == "rest") {
            balance.update((b) => b - 1);
        }
        const resp = await getRGSResponse("/wallet/play", {
            mode: getParam("mode") ?? "BASE",
            currency: getParam("currency"),
            sessionID: getParam("sessionID"),
            amount: 1 * API_MULTIPLIER,
        });
        endRoundResponse.set(null);
        response.set(resp);
        gamestate.set("playing");
        if (resp != null) {
            lastWin.set(resp.round.payoutMultiplier);
        }
        let lw;
        lastWin.subscribe((value) => (lw = value))();
        if (lw == undefined) {
            gamestate.set("rest");
            lastWin.set(0);
        }
        console.log(lw);
        console.log(resp.round.state);
    }
</script>

<div class="game-wrapper">
    <div class="game-content">
        <button on:click={getBookResponse}>Place Bet</button>
        <button on:click={endRound}>End Round</button>
        <h2>Balance: {$balance}</h2>
        <h2>Round Win: {$lastWin}</h2>
    </div>

    <div class="json-stack">
        <h3>play/ response</h3>
        <div class="bet-display">
            <pre>{JSON.stringify($response, null, 2)}</pre>
        </div>

        <h3>end-round/ response</h3>
        <div class="end-display">
            <pre>{JSON.stringify($endRoundResponse, null, 2)}</pre>
        </div>
    </div>
</div>
