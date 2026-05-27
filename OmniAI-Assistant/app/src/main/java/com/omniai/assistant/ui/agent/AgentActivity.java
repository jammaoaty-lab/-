package com.omniai.assistant.ui.agent;

import android.os.Bundle;
import android.view.View;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.omniai.assistant.R;
import com.omniai.assistant.adapter.AgentAdapter;
import com.omniai.assistant.model.Agent;

import java.util.ArrayList;
import java.util.List;

public class AgentActivity extends AppCompatActivity {

    private RecyclerView agentList;
    private View fabCreate;
    private View emptyState;

    private AgentAdapter adapter;
    private List<Agent> agents = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_agent);

        agentList = findViewById(R.id.rv_agent_list);
        fabCreate = findViewById(R.id.fab_create);
        emptyState = findViewById(R.id.empty_state);

        adapter = new AgentAdapter(agents, new AgentAdapter.OnAgentListener() {
            @Override
            public void onAgentClick(Agent agent) {
                openAgentDetail(agent);
            }

            @Override
            public void onAgentDelete(Agent agent) {
                deleteAgent(agent);
            }
        });

        agentList.setLayoutManager(new LinearLayoutManager(this));
        agentList.setAdapter(adapter);

        fabCreate.setOnClickListener(v -> createNewAgent());

        loadAgents();
    }

    private void loadAgents() {
        agents.clear();
        agents.addAll(loadAgentsFromStorage());
        updateEmptyState();
        adapter.notifyDataSetChanged();
    }

    private List<Agent> loadAgentsFromStorage() {
        return new ArrayList<>();
    }

    private void createNewAgent() {
        Agent agent = new Agent();
        agent.setName(getString(R.string.new_agent_name));
        agent.setDescription(getString(R.string.new_agent_description));
        agents.add(agent);
        updateEmptyState();
        adapter.notifyItemInserted(agents.size() - 1);
        openAgentDetail(agent);
    }

    private void openAgentDetail(Agent agent) {
    }

    private void deleteAgent(Agent agent) {
        int index = agents.indexOf(agent);
        if (index >= 0) {
            agents.remove(index);
            updateEmptyState();
            adapter.notifyItemRemoved(index);
        }
    }

    private void updateEmptyState() {
        if (agents.isEmpty()) {
            emptyState.setVisibility(View.VISIBLE);
            agentList.setVisibility(View.GONE);
        } else {
            emptyState.setVisibility(View.GONE);
            agentList.setVisibility(View.VISIBLE);
        }
    }
}
