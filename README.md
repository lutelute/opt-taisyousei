# Asymmetric Optimization Visualizer

対称行列の制約を外した非対称最適化手法の可視化ツール

## Demo

![Demo](demo.webp)

## Features

- **Problem Scale Selector**: Small (N=100) / Large (N=10,000)
- **Matrix Visualization**: 対称行列 vs 非対称行列の構造比較
- **Dual Convergence Charts**: 各手法の収束過程を独立して表示
- **Real-time Animation**: 最適解への経路をリアルタイムで可視化

## Live Demo

👉 **[https://lutelute.github.io/opt-taisyousei/](https://lutelute.github.io/opt-taisyousei/)**

## Key Results

| Metric     | Symmetric (従来) | Asymmetric (提案) |
| ---------- | ---------------- | ----------------- |
| Iterations | 400              | 40                |
| Final Gap  | 10⁻⁵             | 10⁻¹⁰             |
| Complexity | O(n⁴)            | O(n².ˣ)           |

## Files

- `index.html` - Main page
- `script.js` - Simulation logic
- `style.css` - Styling
- `technical_book.md` - Technical documentation

## License

MIT
