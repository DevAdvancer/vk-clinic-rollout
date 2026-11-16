# Clinic Fleet | VK Digital Health

A Next.js operations prototype for VK Digital Health’s smart clinic chair rollout, prepared by SilverSpace Technologies.

## Walkthrough

1. Open **Clinic rollout** and activate a chair at Beacon Grove Clinic. Verify the chair ID and first heartbeat, then confirm activation. Watch the site readiness count update.
2. Open **Demo controls** and select **Simulate outage**. The chair goes offline and a service incident opens automatically.
3. Acknowledge the incident, simulate reconnection, then resolve it. The chair’s event history shows the workflow, and the incident appears under **Resolved**.

**Reset workspace** in **Demo controls** restores the sample data. Changes otherwise persist in the current browser.

## Run locally

Use Node.js 22 LTS, the version selected for Vercel.

```powershell
npm ci
npm run dev
```

Open `http://localhost:3000`. Run `npm run check` for TypeScript validation and `npm run build` for a production build.

## Deploy to Vercel

Import the Git repository in Vercel and choose the **Next.js** framework preset. Set the Root Directory to `vk-clinic-rollout` if the repository also contains other projects. Leave the default build and output settings in place. The prototype needs no environment variables.

To deploy directly from this folder instead:

```powershell
npx vercel login
npx vercel deploy
```

This creates a preview deployment. Use `npx vercel deploy --prod` for the production deployment when ready.

## Demo boundaries

The console uses seven sample sites and simulated device events. It requires no device connection or patient information. The 2,500 locations figure is the planned rollout target. The chair image is an AI-generated concept render.

## Chair artwork

`public/smart-chair-concept.webp` was generated with built-in ImageGen and compressed to WebP for the site.

> Use case: product-mockup. Website hero product photography, landscape 3:2. Introduce a conceptual high-end smart medical exam chair, single device, seen in a crisp three-quarter front view facing slightly towards the left. Full chair visible including sleek rectangular off-white motorized pedestal, angled/reclining headrest with blue-gray slate medical vinyl, segmented footrest and cushions, white polymer shell, a small black diagnostic tablet on an articulated matching arm, and discreet ice-blue light detailing. Center the chair with roomy margins, filling around 80% of image height. Quiet blackened navy studio with subtle indigo and cobalt blue side lighting and a soft circular floor reflection, premium futuristic medical device photography, extremely realistic manufactured details, contrasty but clearly visible edges. No copy, letters, logos, people, diagram marks, watermark, hard image border, or graphics.
