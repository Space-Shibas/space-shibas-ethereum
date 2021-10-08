import './Roadmap.css'
import roadmapPng from './images/roadmap.png'

export const Roadmap = () => {
  return <div className={'Roadmap'}>
    <div className={'RoadmapContent'}>
      {/*<h1>Roadmap</h1>*/}
      <img class={'roadmapPng'} src={roadmapPng} />
    </div>
  </div>
}