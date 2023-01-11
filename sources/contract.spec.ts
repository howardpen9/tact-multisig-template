import { toNano } from "ton";
import { ContractSystem } from "ton-emulator";
import { SampleTactContract } from "./output/sample_SampleTactContract";

describe("contract", () => {
    it("should deploy correctly", async () => {
        // Create ContractSystem and deploy contract
        let system = await ContractSystem.create();
        let owner = system.treasure("owner");
        let nonOwner = system.treasure("non-owner");
        let contract = system.open(await SampleTactContract.fromInit(owner.address));
        let track = system.track(contract.address);
        await contract.send(owner, { value: toNano(1) }, { $$type: "Deploy", queryId: 0n });
        await system.run();

        expect(track.events()).toMatchInlineSnapshot(`
            [
              {
                "type": "deploy",
              },
              {
                "message": {
                  "body": {
                    "cell": "x{946A98B60000000000000000}",
                    "type": "cell",
                  },
                  "bounce": true,
                  "from": "kQAI-3FJVc_ywSuY4vq0bYrzR7S4Och4y7bTU_i5yLOB3A6P",
                  "to": "kQCBxflmV01SE3TxKyFw41-CSwSaohVrRfPoCTY0_OC5yCJ7",
                  "type": "internal",
                  "value": 1000000000n,
                },
                "type": "received",
              },
              {
                "gasUsed": 9409n,
                "type": "processed",
              },
              {
                "messages": [
                  {
                    "body": {
                      "cell": "x{AFF90F570000000000000000}",
                      "type": "cell",
                    },
                    "bounce": true,
                    "from": "kQCBxflmV01SE3TxKyFw41-CSwSaohVrRfPoCTY0_OC5yCJ7",
                    "to": "kQAI-3FJVc_ywSuY4vq0bYrzR7S4Och4y7bTU_i5yLOB3A6P",
                    "type": "internal",
                    "value": 989395000n,
                  },
                ],
                "type": "sent",
              },
            ]
        `);

        // Check counter
        expect(await contract.getCounter()).toEqual(0n);

        // Increment counter
        await contract.send(owner, { value: toNano(1) }, "increment");
        await system.run();
        expect(track.events()).toMatchInlineSnapshot(`
            [
              {
                "message": {
                  "body": {
                    "text": "increment",
                    "type": "text",
                  },
                  "bounce": true,
                  "from": "kQAI-3FJVc_ywSuY4vq0bYrzR7S4Och4y7bTU_i5yLOB3A6P",
                  "to": "kQCBxflmV01SE3TxKyFw41-CSwSaohVrRfPoCTY0_OC5yCJ7",
                  "type": "internal",
                  "value": 1000000000n,
                },
                "type": "received",
              },
              {
                "gasUsed": 5349n,
                "type": "processed",
              },
            ]
        `);

        // Check counter
        expect(await contract.getCounter()).toEqual(1n);

        // Non-owner
        await contract.send(nonOwner, { value: toNano(1) }, "increment");
        await system.run();
        expect(track.events()).toMatchInlineSnapshot(`
            [
              {
                "message": {
                  "body": {
                    "text": "increment",
                    "type": "text",
                  },
                  "bounce": true,
                  "from": "kQCVnZ1On-Ja4xfAfMbsq--jatb5sNnOUN421AHaXbebcCWH",
                  "to": "kQCBxflmV01SE3TxKyFw41-CSwSaohVrRfPoCTY0_OC5yCJ7",
                  "type": "internal",
                  "value": 1000000000n,
                },
                "type": "received",
              },
              {
                "errorCode": 4429,
                "type": "failed",
              },
              {
                "message": {
                  "body": {
                    "type": "empty",
                  },
                  "bounce": false,
                  "from": "kQCBxflmV01SE3TxKyFw41-CSwSaohVrRfPoCTY0_OC5yCJ7",
                  "to": "kQCVnZ1On-Ja4xfAfMbsq--jatb5sNnOUN421AHaXbebcCWH",
                  "type": "internal",
                  "value": 994629000n,
                },
                "type": "sent-bounced",
              },
            ]
        `);
    });
});
