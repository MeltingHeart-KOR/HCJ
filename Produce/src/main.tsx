import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// NOTE: React.StrictMode를 사용하면 개발 모드에서 컴포넌트가
// mount -> unmount -> remount 를 강제로 한 번씩 실행합니다.
// 이 과정에서 <Canvas>(WebGL context)가 두 번 생성/해제되며
// 레이스 컨디션으로 Context Lost가 발생할 수 있어 우선 제거하고 테스트합니다.
// (StrictMode는 개발 편의 기능일 뿐이라 프로덕션 빌드 동작에는 영향 없습니다)
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />,
)
