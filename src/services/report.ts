import { ReportTypes, RetryAttempts } from './constant';
class Report {
  private url: string = '';
  private authorization: string = '';
  private teamId: string = '';
  private retryAttempts = RetryAttempts;

  constructor(type: string, collector: string, authorization: string, teamId: string) {
    if (type === 'ERROR') {
      this.url = collector + ReportTypes.ERROR;
    } else if (type === 'ERRORS') {
      this.url = collector + ReportTypes.ERRORS;
    } else if (type === 'SEGMENT') {
      this.url = collector + ReportTypes.SEGMENT;
    } else if (type === 'SEGMENTS') {
      this.url = collector + ReportTypes.SEGMENTS;
    } else if (type === 'PERF') {
      this.url = collector + ReportTypes.PERF;
    }
    this.authorization = authorization;
    this.teamId = teamId;
  }

  public sendByFetch(data: any) {
    delete data.collector;
    if (!this.url) {
      return;
    }
    const sendRequest = new Request(this.url, { method: 'POST', body: JSON.stringify(data) });

    fetch(sendRequest)
      .then((response) => {
        if (response.status >= 400 || response.status === 0) {
          throw new Error('Something went wrong on api server!');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  public sendByXhr(data: any) {
    if (this.retryAttempts > 1) {
      try {
        delete data.collector;
        if (!this.url) {
          return;
        }
        const xhr = new XMLHttpRequest();

        xhr.open('post', this.url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        if (this.authorization) {
          xhr.setRequestHeader('Authorization', 'Bearer ' + this.authorization);
        }
        if (this.teamId) {
          xhr.setRequestHeader('TeamID', this.teamId);
        }

        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4 && xhr.status !== 0 && xhr.status < 400) {
            // console.log('Report successfully');
          } else if (xhr.readyState === 4 && xhr.status !== 404) {
            this.sendByXhr(data);
            this.retryAttempts--;
          }
        };
        xhr.send(JSON.stringify(data));
      } catch (error) {
        // console.log("error occured while sending data : ", error)
      }
    }
  }
}
export default Report;
