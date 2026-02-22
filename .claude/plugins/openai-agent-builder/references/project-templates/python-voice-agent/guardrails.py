"""{{PROJECT_NAME}} — Guardrail definitions."""
from pydantic import BaseModel
from agents import (
    Agent,
    GuardrailFunctionOutput,
    RunContextWrapper,
    Runner,
    TResponseInputItem,
    input_guardrail,
)


class ContentCheckOutput(BaseModel):
    is_appropriate: bool
    reasoning: str


guardrail_agent = Agent(
    name="Content checker",
    instructions="Check if the user input is appropriate and on-topic.",
    output_type=ContentCheckOutput,
)


@input_guardrail
async def content_guardrail(
    ctx: RunContextWrapper[None], agent: Agent, input: str | list[TResponseInputItem]
) -> GuardrailFunctionOutput:
    result = await Runner.run(guardrail_agent, input, context=ctx.context)
    return GuardrailFunctionOutput(
        output_info=result.final_output,
        tripwire_triggered=not result.final_output.is_appropriate,
    )
