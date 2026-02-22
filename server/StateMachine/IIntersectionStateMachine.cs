using TrafficSimulation.Api.Models;

namespace TrafficSimulation.Api.StateMachine;

public interface IIntersectionStateMachine
{
    IntersectionSnapshot GetCurrentSnapshot();
    IntersectionSnapshot Tick();
}
