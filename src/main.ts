import './style.css'
import { PostCollectionViewModel } from './PostCollectionViewModel';
import { PostCollectionView } from './PostCollectionView';
import { PostViewModel } from './PostViewModel';

// Create and bind our ViewModel to the View
const postCollectionViewModel = new PostCollectionViewModel();
const postCollectionView = new PostCollectionView(postCollectionViewModel);

// Append the View to the app container
const app = document.querySelector<HTMLDivElement>('#app')!;
app.appendChild(postCollectionView.root);

// Load initial posts into the ViewModel
import { blogPosts } from './data';

blogPosts.map(post => {
    const vm = new PostViewModel(post);
    vm.isManaged = true;
    postCollectionViewModel.addPost(vm);
});