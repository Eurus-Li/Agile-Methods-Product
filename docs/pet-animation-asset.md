# 活动庆祝去背素材

- 原图：`web/assets/images/rongrong.jpg`，保留不覆盖。
- 输出：`web/assets/images/rongrong-cutout.png`，内置 image_gen 编辑生成，保留真实 alpha。
- 使用：活动确认弹窗的角色层；背景与地面阴影单独静止渲染。皮肤 tint 使用相同透明轮廓作为 mask。
- 动画：CSS 角色整体轻跳、旋转和伸缩，不是骨骼驱动的耳朵/四肢独立动画。

## 最终提示词

```text
Use case: background-extraction. Edit target: attached local rongrong.jpg. Create a production transparent PNG cutout of ONLY the exact same fluffy white illustrated puppy. Preserve its identity, face, tongue, pose, ears, paws, cream-white painterly fur and proportions. Remove all beige background, floor, floor shadow and paper rectangle completely; actual alpha transparency, no checkerboard baked into pixels, no replacement background. Center the full puppy with small transparent margins, all fur and paws fully visible. No added objects, text, accessories or redesign. Intended as a separate animated sprite over a stationary web UI background.
```
