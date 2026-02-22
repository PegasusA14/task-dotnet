using System.Threading.Tasks;
using TrafficSimulation.Api.Models;

namespace TrafficSimulation.Api.Hubs;

public interface ITrafficClient
{
    Task ReceiveIntersectionState(IntersectionSnapshot snapshot);
}
