import Report from './report';
import ClientMonitor from '../monitor';

class TaskQueue {
  private queues: any[] = [];

  public addTask(data: any) {
    this.queues.push({ data });
  }

  public fireTasks() {
    if (!this.queues || !this.queues.length) {
      return;
    }
    const item = this.queues[0];
    new Report(
      'ERROR',
      item.data.collector,
      ClientMonitor.customOptions.authorization,
      ClientMonitor.customOptions.teamId,
    ).sendByXhr(item.data);
    this.queues.splice(0, 1);
    this.fireTasks();
  }
}

export default new TaskQueue();
