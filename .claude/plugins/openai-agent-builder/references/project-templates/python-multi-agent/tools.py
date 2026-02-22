"""{{PROJECT_NAME}} — Shared tool definitions."""
from agents import function_tool


@function_tool
def example_tool(query: str) -> str:
    """Example tool — replace with your implementation."""
    return f"Result for: {query}"


tools = [example_tool]
