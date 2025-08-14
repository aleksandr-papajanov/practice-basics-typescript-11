import './style.css';
import { PostCollectionViewModel } from './postCollectionViewModel';
import { PostCollectionView } from './postCollectionView';
import { PostViewModel } from './postViewModel';

// Create and bind the ViewModel to the View
const postCollectionViewModel = new PostCollectionViewModel();
const postCollectionView = new PostCollectionView(postCollectionViewModel);

// Append the View to the app container
const app = document.querySelector<HTMLDivElement>('#app')!;
app.appendChild(postCollectionView.root);

// Load initial posts into the ViewModel
import { blogPosts } from './data';

blogPosts.map(post => {
    const vm = new PostViewModel(post);
    postCollectionViewModel.addPost(vm);
});