export const LIBRARY_DATA_CHANGED_EVENT = 'library-data-changed';

export const notifyLibraryDataChanged = () => {
  window.dispatchEvent(new CustomEvent(LIBRARY_DATA_CHANGED_EVENT));
};
