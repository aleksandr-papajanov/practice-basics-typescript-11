import './style.css';
import { PostCollectionViewModel } from './postCollectionViewModel';
import { PostCollectionView } from './postCollectionView';

// Create and bind the ViewModel to the View
const postCollectionViewModel = new PostCollectionViewModel();
const postCollectionView = new PostCollectionView(postCollectionViewModel);

// Append the View to the app container
const app = document.querySelector<HTMLDivElement>('#app')!;
app.appendChild(postCollectionView.root);

postCollectionViewModel.loadCollectionFromStorage();
postCollectionViewModel.enableAutoSave();