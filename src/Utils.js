class Utils{
static processResponse = function(response) {
    if (response.status === 200) {
      return response.json();
    } else {
      return response.json().then((data) => {
        let error      = new Error(response.status);
        error.response = data;
        error.status   = data.status;
        throw error;
      });
    }
  };
};

export default Utils;

