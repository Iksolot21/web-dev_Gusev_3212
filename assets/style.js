// style.js
export const notificationStyles = {
  container: {
    position: 'fixed',
    top: '10px',
    right: '10px',
    padding: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    borderRadius: '5px',
    zIndex: '9999',
  },
  title: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  message: {
    fontSize: '14px',
  },
  closeButton: {
    position: 'absolute',
    top: '5px',
    right: '5px',
    backgroundColor: 'transparent',
    color: 'white',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
  }
};