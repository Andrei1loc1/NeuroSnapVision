def get_best_action(q_table, state):
    return max(q_table[state], key=q_table[state].get)


def coordinate_recommendation(agent_outputs):
    selected_agent = max(
        agent_outputs,
        key=lambda agent: agent_outputs[agent]["priority"]
    )

    return selected_agent, agent_outputs[selected_agent]