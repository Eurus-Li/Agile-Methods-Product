# 活动庆祝去背素材

- 原图：`web/assets/images/rongrong.jpg`，保留不覆盖。
- 输出：`web/assets/images/rongrong-cutout.png`，内置 image_gen 编辑生成，保留真实 alpha。
- 使用：活动确认弹窗的角色层；背景与地面阴影单独静止渲染。皮肤 tint 使用相同透明轮廓作为 mask。
- 动画：CSS 角色整体轻跳、旋转和伸缩，不是骨骼驱动的耳朵/四肢独立动画。
- Home 复用去背角色，场景为 `web/assets/images/rongrong-home-scene.png`（内置 image_gen 编辑生成）；角色着色与配饰构建与庆祝视窗共用，场景保持静止。

## Home 背景最终提示词

```text
Use case: precise-object-edit. Edit target/reference: original rongrong.jpg puppy illustration. Create a background-only square illustration for this puppy's home screen, preserving the original warm cream/beige painterly paper texture and soft handmade brushwork. Remove the puppy completely. Turn the empty scene into a very subtle cozy sunlit nook: soft diffuse window light on the back wall, a small muted sage plant at a far edge, a warm textured floor. Keep the central 65 percent quiet and empty for a separately overlaid animated puppy, no central props and no central cast shadow. Low contrast, warm cream palette harmonious with #FBF3EC, #EEE5DF and #DDEBDC. Full bleed square composition. No dogs, animals, characters, text, interface, frames, watermarks. It must feel like an illustrated environment with visible delicate texture, not a flat solid color.
```

## 最终提示词

```text
Use case: background-extraction. Edit target: attached local rongrong.jpg. Create a production transparent PNG cutout of ONLY the exact same fluffy white illustrated puppy. Preserve its identity, face, tongue, pose, ears, paws, cream-white painterly fur and proportions. Remove all beige background, floor, floor shadow and paper rectangle completely; actual alpha transparency, no checkerboard baked into pixels, no replacement background. Center the full puppy with small transparent margins, all fur and paws fully visible. No added objects, text, accessories or redesign. Intended as a separate animated sprite over a stationary web UI background.
```
