import './styles.css';
import { AnonymizerApp } from './app/anonymizerApp';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('App root is missing.');

new AnonymizerApp().mount(root);
